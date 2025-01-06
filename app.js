const net = require("net");
const dotenv = require("dotenv");
const axios = require("axios");
const logger = require('./utils/logger');

// const datas_location = require("./data/location"); // Ganti dengan path ke file data lokasi

dotenv.config();

const port_hf = process.env.PORT_HF;
const server_url = process.env.SERVER_URL;
const url_server_hag = process.env.URL_SERVER_HAG;

// Fungsi untuk memposting data ke server
const postDataToServer = async (rfidHost, host) => {
  try {
    const formData = new FormData();
    formData.append("rfid_tag", rfidHost);
    formData.append("ipaddress", host);

    const response = await axios.post(`${url_server_hag}/api/tap-on-area`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    logger.log(`Data posted to server ${url_server_hag}/api/tap-on-area rfid:${rfidHost}, ip:${host}`, response.data);
  } catch (error) {
    logger.errorLogger(`Error posting data to server ${url_server_hag}/api/tap-on-area rfid:${rfidHost}, ip:${host} : Error is  ${error.message}`, );
  }
};

// Fungsi untuk membuat koneksi untuk setiap lokasi
const connectToLocation = (locationData) => {
  const { host, location } = locationData;

  const client = new net.Socket();

  client.connect(port_hf, host, () => {
    logger.log(`Connected to ${host}:${port_hf} (${location})`);

    // Kirim heartbeat setiap 30 detik
    setInterval(() => {
      client.write("0");
    }, 3 * 1000);
  });

  // Tangani data yang diterima
  client.on("data", (data) => {
    try {
      const startChar = String.fromCharCode(data[0]); // Karakter pertama
      const endChar = String.fromCharCode(data[data.length - 1]); // Karakter terakhir

      // Potong simbol awal & akhir, konversi ke string
      const hexString = data.slice(1, -2).toString();

      // Konversi hex ke string desimal
      const decimalValue = BigInt(`0x${hexString}`).toString();

      // Tambahkan nol di depan jika panjangnya kurang dari 10
      const rfidHost = decimalValue.padStart(10, "0");
     logger.log(`Data RFID :${rfidHost}, LOCATION ${location} ${startChar}  ${endChar}`);

      // Post data ke server
      postDataToServer(rfidHost, host);
    } catch (err) {
      logger.errorLogger(`Error processing data (${location}): ${err.message}`);
    }
  });

  // Tangani koneksi yang ditutup
  client.on("close", () => {
    console.log(`Connection closed for ${host} (${location})`);
  });

  // Tangani error
  client.on("error", (err) => {
    logger.errorLogger(`Error for ${host} (${location})`, err.message);
    setTimeout(() => {
      process.exit(1);
    }, 5 * 1000);
  });
};

// Fungsi untuk mendapatkan data lokasi dari API atau file lokal
const getLocationData = async () => {
  try {
    logger.log(`Fetching location data from API ${url_server_hag}/api/nfc-reader/show`);	
    const response = await axios.get(`${url_server_hag}/api/nfc-reader/show`);
    if (response.data.status === "success" && Array.isArray(response.data.data)) {
      return response.data.data.map((item) => ({
        location: item.area || "Unknown Area",
        host: item.ipaddress,
      }));
    } else {
      throw new Error("Invalid API response format.");
    }
    
  } catch (error) {
    logger.errorLogger(`Error fetching location data from API ${url_server_hag}/api/nfc-reader/show : Error is  ${error.message}`);
    return require("./data/location");
  }
};

// Inisialisasi koneksi untuk setiap lokasi
(async () => {
  const datas_location = await getLocationData();
  datas_location.forEach((locationData) => {
    connectToLocation(locationData);
  });
})();

// jika menggunakan data lokal
// datas_location.forEach((locationData) => {
//   connectToLocation(locationData);
// });