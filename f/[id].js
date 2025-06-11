export async function getServerSideProps({ params }) {
  const { id } = params;
  const baseId = id.split('_')[0];
  const ext = id.slice(id.lastIndexOf('.'));

  // Catbox লিংক তৈরি
  const catboxLink = `https://files.catbox.moe/${baseId}${ext}`;

  return {
    redirect: {
      destination: catboxLink,
      permanent: false,
    },
  };
}

export default function RedirectPage() {
  return null;
}
