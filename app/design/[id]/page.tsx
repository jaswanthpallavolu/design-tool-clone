import DesignCanvas from "./DesignCanvas"

export default async function Design({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <DesignCanvas id={id} />
}
