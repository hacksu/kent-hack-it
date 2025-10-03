using System;
using System.IO;
using Xunit;
using Project;

public class UnitTest1
{
    [Fact]
    public void Test1()
    {
        var lyolan = new Lyolan();
        string[] data = lyolan.GetKeyAndIV();

        Console.WriteLine($"[DEBUG] KEY -> {data[0]} | IV -> {data[1]}");

        // create encrypted file to be served
        Console.WriteLine("Enter CTF Flag: ");

        // create encrypted file to be served
        string cwd = Environment.CurrentDirectory; // current working directory
        string flagFile = Path.Combine(cwd, "flag.txt");
        string encFile  = Path.Combine(cwd, "flag.enc");

        // For tests, avoid interactive input
        string flag = Console.ReadLine();

        // Write plain flag
        using (StreamWriter writer = new StreamWriter(flagFile))
        {
            writer.WriteLine(flag);
        }

        // Encrypt flag
        string enc = lyolan.Encrypt(flagFile);

        // Write encrypted file
        using (StreamWriter writer = new StreamWriter(encFile))
        {
            writer.WriteLine(enc);
        }

        Console.WriteLine($"[+] Created files in: {cwd}");
        Console.WriteLine($"    Plain: {flagFile}");
        Console.WriteLine($"    Encrypted: {encFile}");

        Console.WriteLine("[+] Created flag files!");
    }
}
