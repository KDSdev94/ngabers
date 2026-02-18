const BASE_API_URL = "https://foodcash.com.br/sistema/apiv4/api.php";
async function test() {
    console.log("Testing with limit=24...");
    const resp = await fetch(`${BASE_API_URL}?action=indonesian-movies&page=1&limit=24`);
    const data = await resp.json();
    console.log("Items count (limit=24):", data.items?.length);

    console.log("Testing with per_page=24...");
    const resp2 = await fetch(`${BASE_API_URL}?action=indonesian-movies&page=1&per_page=24`);
    const data2 = await resp2.json();
    console.log("Items count (per_page=24):", data2.items?.length);

    console.log("Testing with quantity=24...");
    const resp3 = await fetch(`${BASE_API_URL}?action=indonesian-movies&page=1&quantity=24`);
    const data3 = await resp3.json();
    console.log("Items count (quantity=24):", data3.items?.length);
}
test();
