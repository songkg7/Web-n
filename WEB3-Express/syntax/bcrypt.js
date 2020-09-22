const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "1111";
const someOtherPlaintextPassword = "1111231";

bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
  // Store hash in your password DB.
  console.log(hash);
  bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
    console.log("my password", result);
  });
  bcrypt.compare(someOtherPlaintextPassword, hash, function (err, result) {
    console.log("other password", result);
  });
});
