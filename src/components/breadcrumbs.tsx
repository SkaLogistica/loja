import Link from 'next/link'

export const Breadcrumbs: React.FC<{
  category?: string
  subCategory?: string
}> = ({ category, subCategory }) => {
  const CategoryLink: React.FC<{ name?: string; url?: string }> = ({
    name,
    url,
  }) => {
    if (!name) return <></>

    return (
      <li>
        <Link href={`/${url ?? name}`}>{name}</Link>
      </li>
    )
  }

  const CategoryList: React.FC<{
    categories: { name: string | undefined; url?: string | undefined }[]
  }> = ({ categories }) => {
    return (
      <>
        {categories.map((props) => (
          <CategoryLink key={props.name} {...props} />
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
        <CategoryList
          categories={[
            { name: category },
            { name: subCategory, url: `${category}/${subCategory}` },
          ]}
        />
      </ul>
    </div>
  )
}
