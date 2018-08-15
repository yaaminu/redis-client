const tcp = require("net");
const readline = require("readline");

const socket = tcp.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "127.0.0.1:6379> "
});

const processCommand = function(command) {
  command = command.trim();
  let iniCommand = command.split(" ")[0];
  if (iniCommand === "clear") {
    console.clear();
    rl.prompt();
  } else {
    socket.write(`${command}\r\n`);
  }
};

const parseOutput = function(output) {
  const response = output.toString("utf-8");
  const firstChar = response.charAt(0);
  switch (firstChar) {
    case "+":
      console.log(response.substring(1).trim("\r\n"));
      break;
    case "$":
      let secondChar = parseInt(response.charAt(1));
      if (secondChar) {
        console.log(`\"${response.split("\r\n")[1]}\"`);
      } else {
        //treat it as nill if secondChar is NAN
        console.log("(nil)");
      }
      break;
    case "*":
      const arrayResult = response.split("\r\n").slice(1);
      let count = 1; //hacky
      for (let i = 1; i < arrayResult.length; i += 2) {
        console.log(`${count++}) "${arrayResult[i]}"`);
      }
      break;
    case ":":
      console.log(`(integer) ${response.substring(1).trim("\r\n")}`);
      break;
    case "-":
      console.log(`(error) ${response.substring(1).trim("\r\n")}`);
      break;
    default:
      console.log(response);
  }
};

socket.connect(
  "6379",
  "127.0.0.1",
  function() {
    rl.prompt();
    rl.on("line", processCommand);
    rl.on("SIGINT", () => socket.destroy());
  }
);

socket.on("data", function(data) {
  parseOutput(data);
  rl.prompt();
});

socket.on("close", function() {
  console.clear();
  process.exit(0);
});
