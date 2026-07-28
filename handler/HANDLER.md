# CTF Challenge Handler
## About
The handler is a special container that enables challenge instance hosting/handling. Developers can create
jail configurations that allow challenge creators to manage their challenge's jail allowing for more variety
of challenges to be hosted compared to being stuck running a single binary.

These configurations are linked to challenge entries following the rule that one challenge gets at most one
configuration reference. These configurations allow easy handling of controlling what files are read-only
mounted in the jail along with configuring the entrypoint executable that is initially propogated via socat.

## Documentation
These files are written in JSON
| Attribute    | Description                                    |
|--------------|------------------------------------------------|
| `name`       | Name of the configuration.                     |
| `author`     | Creator meta-data.                             |
| `files`      | List of files contained in the generated jail. |
| `entrypoint` | Executable initially executed by socat.        |

The `files` attribute when parsed will automatically append `entrypoint` within the list if it is not present.

### Example Configation
```json
{
    "name":"n0Auth",
    "author":"g3ne1c",
    "files":[],
    "entrypoint":"vuln",
}
```