using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

//-------------------------------------------------------------------------------------------------------------------------------------------------
//  SHA512 Hash Section (key words) c# SHA512 ->  http://stackoverflow.com/questions/11367727/how-can-i-SHA512-a-string-in-c
//
// WHY WE ARE USING SHA-2 Family hash Algorithm instead of MD5
//              http://stackoverflow.com/questions/2117732/reasons-why-sha512-is-superior-to-md5
//
//  note: if we need even stronger hashing security, then look into PBKDF2:
//  http://stackoverflow.com/questions/5392404/key-strengthening-am-i-doing-it-right
//  http://howtodoinjava.com/2013/07/22/how-to-generate-secure-password-hash-md5-sha-pbkdf2-bcrypt-examples/
//  http://stackoverflow.com/questions/2659214/why-do-i-need-to-use-the-rfc2898derivebytes-class-in-net-instead-of-directly
//  http://msdn.microsoft.com/en-us/library/system.security.cryptography.rfc2898derivebytes.aspx
//

//    EXAMPLES OF CALLING THESE METHODS
//
//               string personalId = "123-45-6789";

//               // hash the string
//               byte[] hashed = Cryptography.HashString(HashAlgorithmEnum.SHA512, personalId);

//               // encrypt string
//               byte[] IV;
//               byte[] encrypted = Cryptography.AesEncryptStringToBytes(personalId, out IV);

//               // get the string back from encrypted
//               string decrypted = Cryptography.AesDecryptBytesToString(encrypted, IV);

//               // note: hashed, IV, encrypted would be stored in the Profile table


//-----------------------------------------------------------------------------------------------------------------------------------------------


namespace SuretyTrust.Common
{
    /// <summary>
    /// Cryptography contains static functions for hashing and Aes Symmetric Encryption 
    /// </summary>
    public class Cryptography
    {

        private static int MODULO = 7939782;
        private static byte[] SYMMETRIC_KEY = new byte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31 };  // this one is for test and dev purposes

        //----------------------------------------------------------

        public static void SetSymmetricKey()
        {

            try
            {
                var path = Environment.GetEnvironmentVariable("windir") + "\\System32\\drivers\\etc\\DO_NOT_DELETE.txt";

                using (StreamReader sr = new StreamReader(path))
                {
                    String line = sr.ReadToEnd();
                    var index = line.IndexOf("EaT") + 3;
                    var encryrpted = line.Substring(index).Replace("\r\n", "");
                    var decrypted = BasicEncryption.Decrypt(encryrpted, line.Substring(0, index));
                    var byteArray = decrypted.Split(',');
                    var key = new byte[32];

                    for (int i = 0; i < byteArray.Length; i++)
                    {
                        key[i] = Convert.ToByte(byteArray[i]);
                    }

                    ServiceStaticUtilities.SYMMETRIC_KEY = key;
                }
            }
            catch (Exception e)
            {
                throw new Exception("FAILED: to SetSymmetricKey " + e.Message);
            }


        }

        //----------------------------------------------------------

        /// <summary>
        /// Performs Aes256 Symmetric Encryption on a string
        /// </summary>
        /// <param name="stringToBeEncrypted">The string you want encrypted</param>
        /// <param name="initializationVector">The IV that gets created during encryption</param>
        public static byte[] AesEncryptStringToBytes(string stringToBeEncrypted, out byte[] initializationVector)
        {
            byte[] encrypted;

            using (Aes myAes = Aes.Create())
            {
                if (ServiceStaticUtilities.SYMMETRIC_KEY == null)
                    encrypted = AesEncryption.EncryptStringToBytes_Aes(stringToBeEncrypted, SYMMETRIC_KEY, myAes.IV);
                else
                    encrypted = AesEncryption.EncryptStringToBytes_Aes(stringToBeEncrypted, ServiceStaticUtilities.SYMMETRIC_KEY, myAes.IV);

                initializationVector = myAes.IV;
            }

            return encrypted;
        }

        /// <summary>
        /// Decrypts byte[] to string
        /// </summary>
        /// <param name="encrypted">The byte[] to decrypt</param>
        /// <param name="initializationVector">The IV that gets created during encryption of encrypted</param>
        public static string AesDecryptBytesToString(byte[] encrypted, byte[] initializationVector)
        {
            try
            {
                if (ServiceStaticUtilities.SYMMETRIC_KEY != null)
                    return AesEncryption.DecryptStringFromBytes_Aes(encrypted, ServiceStaticUtilities.SYMMETRIC_KEY, initializationVector);
                else
                    return AesEncryption.DecryptStringFromBytes_Aes(encrypted, SYMMETRIC_KEY, initializationVector);

            }
            catch (Exception)
            {
                return AesEncryption.DecryptStringFromBytes_Aes(encrypted, SYMMETRIC_KEY, initializationVector);
            }
        }

        /// <summary>
        /// Hashes string; returns byte[]; 
        /// example: var result = Cryptography.HashString(HashAlgorithmEnum.SHA256, ssn);
        /// </summary>
        /// <param name="hashAlgorithm">The hash alogorithm you want to use</param>
        /// <param name="stringToBeHashed">The string you want hashed</param>
        public static byte[] HashString(HashAlgorithmEnum hashAlgorithm, string stringToBeHashed)
        {
            return HashAlgorithm.PerformHash(hashAlgorithm, ref stringToBeHashed);
        }

        /// <summary>
        /// Hashes string; hash result has modulo performed on it to make the hash result smaller; returns -1 if hashing did not return a result; 
        /// example: double result = Cryptography.HashStringWithModulo(HashAlgorithmEnum.SHA512, ssn, null);
        /// </summary>
        /// <param name="hashAlgorithm">The hash alogorithm you want to use</param>
        /// <param name="stringToBeHashed">The string you want hashed</param>
        /// <param name="moduloAmount">The # for modulo operator to perform against the hash result; if you pass null, a default modulo # will be used</param>
        public static double HashStringWithModulo(HashAlgorithmEnum hashAlgorithm, string stringToBeHashed, int? moduloAmount)
        {
            double result = -1;
            byte[] hashed = HashAlgorithm.PerformHash(hashAlgorithm, ref stringToBeHashed);

            if (hashed.Length > 0)
            {
                result = moduloAmount != null ? hashed.ModuloByAmountToDouble(Convert.ToInt32(moduloAmount)) : hashed.ModuloByAmountToDouble(MODULO);
            }

            return result;
        }

        private class HashAlgorithm
        {
            public static byte[] PerformHash(HashAlgorithmEnum hashAlgorithm, ref string stringToBeHashed)
            {
                byte[] hashed;
                byte[] data = Encoding.UTF8.GetBytes(stringToBeHashed);

                switch (hashAlgorithm)
                {
                    case HashAlgorithmEnum.SHA256:
                        using (SHA256 sha256M = new SHA256Managed())
                        {
                            hashed = sha256M.ComputeHash(data);
                        }
                        break;
                    case HashAlgorithmEnum.SHA512:
                        using (SHA512 sha512M = new SHA512Managed())
                        {
                            hashed = sha512M.ComputeHash(data);
                        }
                        break;
                    default:
                        hashed = new byte[] { };
                        break;
                }

                return hashed;
            }
        }

        private class AesEncryption
        {
            public static byte[] EncryptStringToBytes_Aes(string plainText, byte[] Key, byte[] IV)
            {
                // Check arguments. 
                if (plainText == null || plainText.Length <= 0)
                    throw new ArgumentNullException("plainText");
                if (Key == null || Key.Length <= 0)
                    throw new ArgumentNullException("Key");
                if (IV == null || IV.Length <= 0)
                    throw new ArgumentNullException("Key");
                byte[] encrypted;
                // Create an Aes object 
                // with the specified key and IV. 
                using (Aes aesAlg = Aes.Create())
                {
                    aesAlg.Key = Key;
                    aesAlg.IV = IV;

                    // Create a decrytor to perform the stream transform.
                    ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                    // Create the streams used for encryption. 
                    using (MemoryStream msEncrypt = new MemoryStream())
                    {
                        using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                        {
                            using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                            {

                                //Write all data to the stream.
                                swEncrypt.Write(plainText);
                            }
                            encrypted = msEncrypt.ToArray();
                        }
                    }
                }

                // Return the encrypted bytes from the memory stream. 
                return encrypted;

            }

            public static string DecryptStringFromBytes_Aes(byte[] cipherText, byte[] Key, byte[] IV)
            {
                // Check arguments. 
                if (cipherText == null || cipherText.Length <= 0)
                    throw new ArgumentNullException("cipherText");
                if (Key == null || Key.Length <= 0)
                    throw new ArgumentNullException("Key");
                if (IV == null || IV.Length <= 0)
                    throw new ArgumentNullException("Key");

                // Declare the string used to hold 
                // the decrypted text. 
                string plaintext = null;

                // Create an Aes object 
                // with the specified key and IV. 
                using (Aes aesAlg = Aes.Create())
                {
                    aesAlg.Key = Key;
                    aesAlg.IV = IV;

                    // Create a decrytor to perform the stream transform.
                    ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                    // Create the streams used for decryption. 
                    using (MemoryStream msDecrypt = new MemoryStream(cipherText))
                    {
                        using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                        {
                            using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                            {

                                // Read the decrypted bytes from the decrypting stream
                                // and place them in a string.
                                plaintext = srDecrypt.ReadToEnd();
                            }
                        }
                    }

                }

                return plaintext;
            }



        }// END: private class AesEncryption


        private class BasicEncryption
        {
            // This constant string is used as a "salt" value for the PasswordDeriveBytes function calls.
            // This size of the IV (in bytes) must = (keysize / 8).  Default keysize is 256, so the IV must be
            // 32 bytes long.  Using a 16 character string here gives us 32 bytes when converted to a byte array.
            private static readonly byte[] initVectorBytes = Encoding.ASCII.GetBytes("tu89geji340t89u2");

            // This constant is used to determine the keysize of the encryption algorithm.
            private const int keysize = 256;

            public static string Encrypt(string plainText, string passPhrase)
            {
                byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
                using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null))
                {
                    byte[] keyBytes = password.GetBytes(keysize / 8);
                    using (RijndaelManaged symmetricKey = new RijndaelManaged())
                    {
                        symmetricKey.Mode = CipherMode.CBC;
                        using (ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes))
                        {
                            using (MemoryStream memoryStream = new MemoryStream())
                            {
                                using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                                {
                                    cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                    cryptoStream.FlushFinalBlock();
                                    byte[] cipherTextBytes = memoryStream.ToArray();
                                    return Convert.ToBase64String(cipherTextBytes);
                                }
                            }
                        }
                    }
                }
            }

            public static string Decrypt(string cipherText, string passPhrase)
            {
                byte[] cipherTextBytes = Convert.FromBase64String(cipherText);
                using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null))
                {
                    byte[] keyBytes = password.GetBytes(keysize / 8);
                    using (RijndaelManaged symmetricKey = new RijndaelManaged())
                    {
                        symmetricKey.Mode = CipherMode.CBC;
                        using (ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes))
                        {
                            using (MemoryStream memoryStream = new MemoryStream(cipherTextBytes))
                            {
                                using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                                {
                                    byte[] plainTextBytes = new byte[cipherTextBytes.Length];
                                    int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                    return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                                }
                            }
                        }
                    }
                }
            }

        }


    }// END: public static class Cryptography
}
