# CTF Challenge Handler
## About
The handler is a special container that enables challenge instance hosting/handling. Developers can create
jail configurations that allow challenge creators to manage their challenge's jail allowing for more variety
of challenges to be hosted compared to being stuck running a single binary.

These configurations are linked to challenge entries following the rule that one challenge gets at most one
configuration reference. These configurations allow easy handling of controlling what files are read-only
mounted in the jail along with configuring the entrypoint executable that is initially propogated via nsjail.

## Documentation
These files are written in JSON
| Attribute    | Description                                    |
|--------------|------------------------------------------------|
| `name`       | Name of the configuration.                     |
| `author`     | Creator meta-data.                             |
| `files`      | List of files contained in the generated jail. |
| `entrypoint` | Executable initially executed by nsjail.       |

The `files` attribute when parsed will automatically append `entrypoint` within the list if it is not present. For challenge files (excludes natural system files) within the jail, they will always exist at the root of the jail.

### Example Configation
```json
{
    "name":"n0Auth",
    "author":"g3ne1c",
    "files":[
        "/vuln_comp",
        "/lib/x86_64-linux-gnu/libc.so.6"
    ],
    "entrypoint":"/vuln",
}
```
As you can see the files `vuln` and `vuln_comp` are ctf challenge files, thus exist within the root directory, while natural files like `libc.so.6` use the absolute system path because these files are aquired from the jail host file-system.