export async function getServerSideProps({ params }) {
  const id = params.id;
  const originalUrl = `https://files.catbox.moe/${id}`;

  return {
    redirect: {
      destination: originalUrl,
      permanent: false,
    },
  };
}

export default function RedirectPage() {
  return null;
}
