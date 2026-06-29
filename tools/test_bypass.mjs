process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
async function test() {
  const response = await fetch("https://103.57.220.210/", {
    headers: {
      Host: "thongtaccongquangninh.com"
    }
  });
  console.log(response.status);
}
test().catch(console.error);
