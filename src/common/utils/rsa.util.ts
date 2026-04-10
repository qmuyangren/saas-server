import * as crypto from 'crypto';

/**
 * RSA 工具类
 * 用于密码加密传输（HTTP 场景下保护密码安全）
 */
const KEY_SIZE = 2048; // 密钥长度（2048 位更安全）

/**
 * 生成 RSA 密钥对
 * @returns { publicKey: string, privateKey: string }
 */
export function generateRsaKeyPair() {
  // 使用 any 绕过 @types/node 类型定义问题
  const { publicKey, privateKey } = (crypto as any).generateKeyPairSync('rsa', {
    modulusLength: KEY_SIZE,
    publicFormat: 'spki',
    privateFormat: 'pkcs8',
  });

  return {
    publicKey: publicKey.export({ format: 'pem', type: 'spki' }) as string,
    privateKey: privateKey.export({ format: 'pem', type: 'pkcs8' }) as string,
  };
}

/**
 * 公钥加密
 * @param data - 待加密数据
 * @param publicKey - 公钥
 * @returns 加密后的字符串（base64）
 */
export function rsaEncrypt(data: string, publicKey: string): string {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );
  return encrypted.toString('base64');
}

/**
 * 私钥解密
 * @param encryptedData - 加密的数据（base64）
 * @param privateKey - 私钥
 * @returns 解密后的字符串
 */
export function rsaDecrypt(encryptedData: string, privateKey: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );
  return decrypted.toString('utf8');
}
