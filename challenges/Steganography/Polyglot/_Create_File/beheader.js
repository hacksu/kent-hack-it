const { $ } = require("bun");
const fs = require("fs/promises");

function printHelpAndExit () {

  console.log(`\
Usage: beheader <output> <image> <video|audio> [-options] [appendable...]

Polyglot generator for media files.

Arguments:
    output               Path of resulting polyglot file
    image                Path of input image file
    video|audio          Path of input video (or audio) file
    appendable           Path(s) of files to append without parsing

Options:
    -h, --html <path>    Path to HTML document
    -p, --pdf <path>     Path to PDF document
    -z, --zip <path>     Path to ZIP-like archive (repeatable)
    -e, --extra <path>   Path to short (<200b) file to include near the header
    --help               Print this help message and exit

Notes:
    * Video (and audio) gets re-encoded to MP4, images get converted to PNG in an ICO container.
    * Repeated ZIP files (e.g. \`-z foo.zip -z bar.zip\`) will be re-packed into one file. In case of conflict, files in later archives overwrite previous files.
    * ZIP-like archives are inserted last, after any appendables.
    * The \`--extra\` data gets inserted at address 22. Input size is not regulated - exceeding ~200 bytes or less may break other components.
`);

  process.exit(1);

}

// Parse command line by cloning argv and removing flags first
const argv = structuredClone(process.argv);

let extra = "";
let html, pdf, zip = [];

// Search for supported flags, handle them, and remove them from argv clone
for (let i = argv.length - 1; i >= 0; i --) {
  let match = true;
  switch (argv[i]) {

    case "--help":
      printHelpAndExit();
      break;

    case "--html": case "-h":
      html = argv[i + 1];
      break;

    case "--pdf": case "-p":
      pdf = argv[i + 1];
      break;

    case "--zip": case "-z":
      zip.push(argv[i + 1]);
      break;

    case "--extra": case "-e":
      extra = await Bun.file(argv[i + 1]).text();
      break;

    default: match = false; break;
  }
  if (match) argv.splice(i, 2);
}

// Handle mandatory arguments
const [output, image, video] = argv.slice(2);
if (!output) printHelpAndExit();

// Treat remaining arguments as appendable binaries
const appendables = argv.slice(5);

// Converts a number to a 4-byte little-endian uint8 buffer
function numberTo4bLE (num) {
  const bytes = new Uint8Array(4);
  bytes[0] = num & 0xFF;
  bytes[1] = (num >> 8) & 0xFF;
  bytes[2] = (num >> 16) & 0xFF;
  bytes[3] = (num >> 24) & 0xFF;
  return bytes;
}

// Converts a number to a 4-byte big-endian uint8 buffer
function numberTo4bBE (num) {
  const bytes = new Uint8Array(4);
  bytes[3] = num & 0xFF;
  bytes[2] = (num >> 8) & 0xFF;
  bytes[1] = (num >> 16) & 0xFF;
  bytes[0] = (num >> 24) & 0xFF;
  return bytes;
}

// Finds the index of a sub-array in an array
function findSubArrayIndex (array, subArray, startIndex = 0) {
  for (let i = startIndex; i <= array.length - subArray.length; i++) {
    let match = true;
    for (let j = 0; j < subArray.length; j++) {
      if (array[i + j] !== subArray[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}

// Left-pads a string with specified character up to target length
function padLeft (str, targetLen, padChar = "0") {
  str = str.toString();
  return padChar.repeat(Math.max(0, targetLen - str.length)) + str;
}

const tmp = Math.random().toString(36).slice(2);

// Convert input image to 32 bpp PNG, strip all metadata
await $`convert "${image}" -define png:color-type=6 -depth 8 -alpha on -strip "${tmp + ".png"}"`;

const pngFile = Bun.file(tmp + ".png");
const atomFile = Bun.file(tmp + ".atom");
const htmlFile = html && Bun.file(html);
const pdfFile = pdf && Bun.file(pdf);

const ftypBuffer = new Uint8Array(256 + 32);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Wrap in try/catch/finally to clean up temporary files on error
try {

  // ICO signature, doubling in purpose to set a 256 byte atom size
  ftypBuffer[2] = 1;

  // Write the MP4 "ftyp" atom name
  ftypBuffer.set(encoder.encode("ftyp"), 4);

  /**
   * This whole procedure eventually clears the atom name, but some
   * players (looking at you, VLC) *do* need a named ftyp atom to
   * identify an MP4 video file.
   *
   * To work around this, we extend the size of this atom by 32 bytes,
   * which is enough to write the data for another ftyp atom at the
   * bottom. Later, we will clear this byte, which will effectively
   * split those last 32 bytes off of this atom, forming a new atom.
   *
   * The more careful players will ignore our first unnamed atom,
   * and move onto this next "proper" ftyp atom. Less careful players
   * won't care about a duplicate. This bithack is actually easier
   * than coercing mp4edit to create an early ftyp duplicate.
   *
   * Unfortunately, this still doesn't fix VLC. It needs ftyp to be
   * within the first 256 bytes, which we simply can't do.
   */
  ftypBuffer[3] = 32;
  ftypBuffer.set([ // Standard MP4 "header" data
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
    0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31,
  ], 256);

  ftypBuffer[12] = 32; // First image bit depth
  ftypBuffer.set(numberTo4bLE(pngFile.size), 14); // Image data size

  const streamProbe = await $`ffprobe -v error -select_streams v -show_entries stream=codec_type -of json "${video}"`.quiet();
  const isVideo = !!JSON.parse(streamProbe.stdout.toString()).streams.length;

  // Re-encode input video to a highly normalized MP4 (or M4A)
  if (isVideo) await $`ffmpeg -i "${video}" -c:v libx264 -strict -2 -preset slow -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -f mp4 "${tmp + "0.mp4"}"`.quiet();
  else await $`ffmpeg -i "${video}" -c:a aac -b:a 192k "${tmp + "0.mp4"}"`.quiet();

  // The ftyp atom is not yet finished, we replace it only to measure offsets
  await Bun.write(atomFile, ftypBuffer);
  await $`./mp4edit --replace ftyp:"${tmp + ".atom"}" "${tmp + "0.mp4"}" "${tmp + "1.mp4"}"`;

  // Wrap the input HTML document (if any) to avoid rendering surrounding garbage
  const htmlString = html ? `--><style>body{font-size:0}</style><div style=font-size:initial>${await htmlFile.text()}</div><!--` : "";

  // Create a "skip" atom to store the PNG (and HTML) data
  const skipBufferData = new Uint8Array(pngFile.size + htmlString.length);
  // If applicable, HTML is inserted first to reduce browser loading time
  if (html) skipBufferData.set(encoder.encode(htmlString));
  skipBufferData.set(await pngFile.bytes(), htmlString.length);

  const skipBufferHead = new Uint8Array(8);
  skipBufferHead.set(numberTo4bBE(skipBufferData.length + 8), 0);
  skipBufferHead.set(encoder.encode("skip"), 4);

  const skipBuffer = new Uint8Array(skipBufferData.length + 8);
  skipBuffer.set(skipBufferHead, 0);
  skipBuffer.set(skipBufferData, 8);

  // Insert the skip atom into the output file to get its final offset
  await Bun.write(atomFile, skipBuffer);
  await $`./mp4edit --insert skip:"${tmp + ".atom"}" "${tmp + "1.mp4"}" "${tmp + "2.mp4"}"`;

  // Find offset of PNG data in MP4 file
  const offsetReference = await Bun.file(tmp + "2.mp4").bytes();
  const pngOffset = findSubArrayIndex(offsetReference, skipBufferHead) + 8 + htmlString.length;

  // Set PNG data offset for first ICO image
  ftypBuffer.set(numberTo4bLE(pngOffset), 18);
  // Set ICO image count to 1 and clear atom name
  // Luckily, many players just assume that ftyp is the first atom
  ftypBuffer.set([1, 0, 0, 0], 4);

  // Write list of real supported brands to help convince stubborn decoders
  ftypBuffer.set(encoder.encode("isomiso2avc1mp41"), 240);

  // Keep track of the starting address of free space in the ftyp atom
  let atomFreeAddr = 22;

  // Add any user-provided early header data
  ftypBuffer.set(encoder.encode(extra), atomFreeAddr);
  atomFreeAddr += extra.length;
  // Create an HTML comment to help with filtering out garbage
  ftypBuffer.set(encoder.encode("<!--"), 22 + extra.length);
  atomFreeAddr += 4;

  if (pdf) {
    // First PDF pass - create an early header and wrap MP4 in a PDF object
    const pdfBuffer = await pdfFile.bytes();
    const mp4Size = Bun.file(tmp + "2.mp4").size;
    // Copy PDF header from input file
    ftypBuffer[atomFreeAddr] = 0x0A;
    ftypBuffer.set(pdfBuffer.slice(0, 9), atomFreeAddr + 1);
    atomFreeAddr += 10;
    /**
     * Create a PDF object spanning the whole rest of the MP4.
     *
     * Since we're replacing data in an existing fixed-size buffer,
     * and the Length property is provided in ASCII, the value of
     * the number itself might shift the length.
     *
     * This routine dynamically adjusts the object definition string
     * until the number matches the actual length of the file.
     */
    let objString;
    // Start by assuming that the string contains the full file size
    let offset = 30 + mp4Size.toString().length;
    // Each iteration, decrement the offset and update the object string.
    // This is repeated until offset == string.length, at which point we
    // know that we've subtracted the correct amount.
    do {
      offset --;
      objString = `\n1 0 obj\n<</Length ${mp4Size - atomFreeAddr - extra.length - offset}>>\nstream\n`;
    } while (offset !== objString.length);
    // Write the string into the dead space of the ftyp atom
    ftypBuffer.set(encoder.encode(objString), atomFreeAddr + extra.length);
    atomFreeAddr += objString.length;
  }

  // Now the ftyp atom is ready, replace it and write the output file
  await Bun.write(atomFile, ftypBuffer);
  await $`./mp4edit --replace ftyp:"${tmp + ".atom"}" "${tmp + "2.mp4"}" "${output}"`;

  // Fix earlier bithack, splitting off the extra ftyp atom
  const outputfd = await fs.open(output, "r+");
  await outputfd.write(Buffer.from([0]), 0, 1, 3);
  await outputfd.close();

  if (pdf) {
    // Second PDF pass - close the object and add the real PDF file
    const objectTerminator = encoder.encode("\nendstream\nendobj\n");
    const pdfBuffer = new Uint8Array(pdfFile.size + objectTerminator.length + 10);
    pdfBuffer.set(objectTerminator);
    pdfBuffer.set(await pdfFile.bytes(), objectTerminator.length);
    // Find cross-reference table
    const xrefStart = findSubArrayIndex(pdfBuffer, encoder.encode("\nxref")) + 1;
    const offsetStart = findSubArrayIndex(pdfBuffer, encoder.encode("\n0000000000"), xrefStart) + 1;
    const startxrefStart = findSubArrayIndex(pdfBuffer, encoder.encode("\nstartxref"), xrefStart) + 1;
    const startxrefEnd = pdfBuffer.indexOf(0x0A, startxrefStart + 11);
    // Attempt to fix offsets
    try {
      if (xrefStart <= 0 || offsetStart <= 0 || startxrefStart <= 0 || startxrefEnd <= 0) {
        throw "Failed to find xref table";
      }
      const outputFile = Bun.file(output);
      // Read the xref header (name, index, count) as a string
      const xrefHeader = decoder.decode(pdfBuffer.slice(xrefStart, offsetStart));
      // Parse the string to extract the entry count
      const count = parseInt(xrefHeader.trim().replaceAll("\n", " ").split(" ").pop(), 10);
      // For all `count` entries, read the offset and increment it
      let curr = offsetStart;
      for (let i = 0; i < count; i ++) {
        const offset = parseInt(decoder.decode(pdfBuffer.slice(curr, curr + 10)).trim(), 10);
        const newOffset = offset + outputFile.size + objectTerminator.length;
        pdfBuffer.set(encoder.encode(padLeft(newOffset, 10).slice(0, 10)), curr);
        curr = pdfBuffer.indexOf(0x0A, curr + 1) + 1;
      }
      // Adjust startxref offset
      const startxref = parseInt(decoder.decode(pdfBuffer.slice(startxrefStart + 10, startxrefEnd)).trim(), 10);
      const newStartxref = (startxref + outputFile.size + objectTerminator.length).toString();
      pdfBuffer.set(encoder.encode(newStartxref), startxrefStart + 10);
      // The above operation may overwrite %%EOF, replace it just in case
      pdfBuffer.set(encoder.encode("\n%%EOF\n"), startxrefStart + 10 + newStartxref.length);
      for (let i = startxrefStart + newStartxref.length + 17; i < pdfBuffer.length; i ++) {
        pdfBuffer[i] = 0;
      }
    } catch (e) {
      console.log(e);
      console.log("WARNING: Failed to fix PDF offsets. This is probably still fine.");
    }
    // Append this buffer to the output file
    await fs.appendFile(output, pdfBuffer);
  }

  // Append any other files found on the command line
  for (const path of appendables) {
    if (!path) continue;
    await $`cat "${path}" >> "${output}"`.quiet();
  }

  if (zip.length > 0) {
    // Extract all ZIP-like archives to a temporary directory
    await fs.mkdir(tmp + "dir");
    for (const curr of zip) {
      await $`unzip -d "${tmp}dir" "${curr}"`.quiet();
    }
    // Create archive from temporary directory
    await $`cd "${tmp}dir" && zip -r9 "../${tmp + ".zip"}" .`.quiet();
    // Append the ZIP file as-is to the end of the file
    await $`cat "${tmp + ".zip"}" >> "${output}"`.quiet();
    // Apply self-extracting archive offset fix for better compatibility
    await $`zip -A "${output}"`.quiet();
  }

} catch (e) {

  // Just forward the error, we're not handling it
  console.error(e);
  if ("stderr" in e) console.log(e.stderr.toString());

} finally {

  try {
    await pngFile.delete();
    await atomFile.delete();

    await Bun.file(tmp + "0.mp4").delete();
    await Bun.file(tmp + "1.mp4").delete();
    await Bun.file(tmp + "2.mp4").delete();

    if (await fs.exists(tmp + "dir")) {
      await fs.rm(tmp + "dir", { recursive: true, force: true });
    }
    if (await fs.exists(tmp + ".zip")) {
      await fs.rm(tmp + ".zip", { force: true });
    }
  } catch { /* Cleanup can fail silently */ }

}

