"use client";

export async function uploadImage(file: File) {
  const result = await fetch(`/changelog/_admin/upload?file=${file.name}`);
  const { response, options } = await result.json();
  const { url, fields } = response;
  const formData = new FormData();
  for (const [key, value] of Object.entries({ ...fields, file })) {
    formData.append(key, value as string | Blob);
  }

  await fetch(url, {
    method: "POST",
    body: formData,
  });
  return {
    url: `${url}${encodeURIComponent(response.fields.key)}`,
    originalFilename: file.name,
  };
}
