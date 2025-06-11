export async function getServerSideProps({ params }) {
  const id = Array.isArray(params.id) ? params.id.join("/") : params.id;
  return {
    redirect: {
      destination: `https://files.catbox.moe/${id}`,
      permanent: false,
    },
  };
}

export default function RedirectPage() {
  return null;
}
