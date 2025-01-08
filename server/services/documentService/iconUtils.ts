export const iconUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);

    const buffer = await response.arrayBuffer();

    const base64 = Buffer.from(buffer).toString('base64');

    return `data:image/svg+xml;base64,${base64}`;
  } catch (error: any) {
    throw new Error(`Erreur lors de la conversion : ${error.message}`);
  }
};
