using System;

public class HelloWorld
{
    public static void Main(string[] args)
    {
        string a = "";
        string b = "";

        Console.WriteLine("Enter pastebin url (holding the flag): ");
        a = Console.ReadLine();

        Console.WriteLine("Enter XOR key: ");
        b = Console.ReadLine();

        string o = "const int EP[] = {";
        
        int i = 0;
        int k = 0;
        
        while (i < a.Length) {
            int l = k++ % b.Length;
            int j = a[i++] ^ b[l];
            
            if (i < a.Length) {
                o += j.ToString() + ",";
            } else {
                o += j.ToString();
            }
        }
        
        o += "};";
        
        Console.WriteLine("\n:::: DLL Lyolan Variables ::::");
        Console.WriteLine($"const string Xy = \"{b}\";");
        Console.WriteLine(o);
    }
}
