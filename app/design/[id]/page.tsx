import DesignEditorPage from "../../components/DesignEditorPage"

export default async function Design({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <DesignEditorPage id={id} />
}

// Made with Bob
