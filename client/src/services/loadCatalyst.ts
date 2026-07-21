declare global {
  interface Window {
    catalyst: any;
  }
}

export async function loadCatalyst(): Promise<any> {
  if (window.catalyst) {
    return window.catalyst;
  }

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  await loadScript(
    "https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js"
  );

  await loadScript("/__catalyst/sdk/init.js");

  return window.catalyst;
}