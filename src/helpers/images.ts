// This function uses fetch to load images for both browser and Node.js support from 17.5 onwards (we're going to set > that as a min version level.).
// or you can always just:
// import fetch from 'node-fetch';
// global.fetch = fetch;

async function fetchImage(src: string): Promise<Uint8Array> {
  try {
    const response = await fetch(src, {
      method: "GET",
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${src}`);
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error: any) {
    throw new Error(`Error fetching image from ${src}: ${error.message}`);
  }
}

export { fetchImage };
