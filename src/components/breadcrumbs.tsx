import Link from 'next/link'

export const Breadcrumbs: React.FC<{
  category?: string
  subCategory?: string
}> = ({ category, subCategory }) => {
  const CategoryLink: React.FC<{ name?: string }> = ({ name }) => {
    if (!name) return <></>

    return (
      <li>
        <Link href={`/${name}`}>{name}</Link>
      </li>
    )
  }

  const CategoryList: React.FC<{ names: (string | undefined)[] }> = ({
    names,
  }) => {
    return (
      <>
        {names.map((name) => (
          <CategoryLink key={name} name={name} />
        ))}
      </>
    )
  }

  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li>
          <Link href="/">Página Inicial</Link>
        </li>
        <CategoryList names={[category, subCategory]} />
      </ul>
    </div>
  )
}
