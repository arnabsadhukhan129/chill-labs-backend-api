export function generateReferralCode(
  length: number,
  inputString: string
): string {
  const digits = "0123456789";
  let referralCode = "";
  const isOdd = length % 2 !== 0;
  const halfLength = Math.floor(length / 2);

  let stringPart = halfLength;
  let digitPart = length - halfLength;

  if (isOdd) {
    stringPart = Math.floor(length / 2);
    digitPart = length - stringPart;
  }

  inputString = inputString
    .toUpperCase()
    .split(" ")
    .map((word) => word[0])
    .join("");

  for (let i = 0; i < stringPart; i++) {
    referralCode += inputString.charAt(i);
  }

  for (let i = 0; i < digitPart; i++) {
    // Randomly select a digit
    referralCode += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  return referralCode;
}
