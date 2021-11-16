import JsSHA from 'jssha';

export default function getAuthorizationHeader() {
  const AppID = 'f775d82ff0284568bbcd15624bd4ae25';
  const AppKey = 'tUVYmt4OVHprMfJ0UijNyR8yTeI';
  const GMTString = new Date().toGMTString();
  const ShaObj = new JsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update(`x-date: ${GMTString}`);
  const HMAC = ShaObj.getHMAC('B64');
  const Authorization = `hmac username="${AppID}", algorithm="hmac-sha1", headers="x-date", signature="${HMAC}"`;
  return { Authorization, 'X-Date': GMTString };
}
