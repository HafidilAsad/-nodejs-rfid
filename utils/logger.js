module.exports = {
  log: (message) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString("en-US")} ${now.toLocaleTimeString("en-US", { hour12: false })}`;
    console.log(`[LOG] [${timestamp}] ${message}`);
  },
  errorLogger: (message) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString("en-US")} ${now.toLocaleTimeString("en-US", { hour12: false })}`;
    const redBox = `\x1b[41m\x1b[37m`; 
    const reset = `\x1b[0m`; 
    console.error(`${redBox}[ERROR] [${timestamp}] ${message}${reset}`);
  },
};

