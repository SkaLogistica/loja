import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'

import { Head, Header } from '@root/components'
import { trpc } from '@root/utils'

interface Props extends React.HTMLAttributes<HTMLHeadingElement> {
  defaultValue?: string
  searchSubmit?: (e: FormEvent<HTMLFormElement>) => void
  searchOnChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

const HamburguerIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 512 512"
    >
      <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
    </svg>
  )
}
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 512 512"
    >
      <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
    </svg>
  )
}
const ToggleMenu: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <label
      htmlFor="menu-drawer"
      className={`swap-rotate swap lg:hidden ${active ? 'swap-active' : ''}`}
    >
      <HamburguerIcon className="swap-off fill-current" />
      <CloseIcon className="swap-on fill-current" />
    </label>
  )
}

export const StoreLayout: React.FC<Props> = ({
  searchSubmit,
  searchOnChange,
  defaultValue,
  children,
}) => {
  const [drawerOpen, setDrawer] = useState(false)
  const { data: categories } = trpc.category.getAllCategories.useQuery(
    {},
    {
      staleTime: Infinity,
    }
  )

  /* TODO: create components: CategoriesMenu, SubCategories{Menu,Disclosure} */
  const categoriesItems = categories?.map((category) => (
    <li tabIndex={0} key={category.id}>
      <span className="font-bold uppercase text-orange-500 [&_svg]:hover:rotate-180">
        <Link href={`/${category.name}`}>{category.name}</Link>
        {category.subcategories.length > 0 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="192"
            height="192"
            fill="#000000"
            viewBox="0 0 256 256"
            className="h-5 w-5 duration-700 ease-in-out"
          >
            <rect width="256" height="256" fill="none"></rect>
            <polyline
              points="208 96 128 176 48 96"
              fill="none"
              stroke="#000000"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            ></polyline>
          </svg>
        ) : (
          <></>
        )}
      </span>
      {category.subcategories.length > 0 ? (
        <ul className="rounded-box bg-base-100 p-2 shadow-lg lg:z-20">
          {category.subcategories.map((subcategory) => (
            <li key={subcategory.id}>
              <span className="capitalize">
                <Link href={`/${category.name}/${subcategory.name}`}>
                  {subcategory.name}
                </Link>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <></>
      )}
    </li>
  ))

  return (
    <div className="flex flex-col items-center">
      <div className="drawer">
        <input
          id="menu-drawer"
          type="checkbox"
          className="drawer-toggle"
          onChange={() => setDrawer((old) => !old)}
        />
        <div className="drawer-content flex flex-col">
          <Head />
          <div className="sticky top-0 left-0 z-10 max-h-max bg-base-100">
            <div className="fixed top-4 left-8 z-20">
              <ToggleMenu active={drawerOpen} />
            </div>
            <Header
              searchSubmit={searchSubmit}
              searchOnChange={searchOnChange}
              defaultValue={defaultValue}
            />
            <div className="w-full lg:bg-primary/20">
              <div className="hidden flex-none lg:block">
                <ul className="menu menu-horizontal w-full justify-center gap-4 p-2">
                  <li>
                    <span className="font-bold uppercase text-orange-500 [&_svg]:hover:rotate-180">
                      <Link href={`/`}>Página Inicial</Link>
                    </span>
                  </li>
                  {categoriesItems}
                </ul>
              </div>
            </div>
          </div>
          {children}
        </div>
        <div className="drawer-side">
          <label htmlFor="menu-drawer" className="drawer-overlay"></label>
          <ul className="menu w-2/3 bg-base-100 p-4 md:w-80">
            <ToggleMenu active={drawerOpen} />
            <li>
              <span className="font-bold uppercase text-orange-500 [&_svg]:hover:rotate-180">
                <Link href={`/`}>Página Inicial</Link>
              </span>
            </li>
            {categoriesItems}
          </ul>
        </div>
      </div>
    </div>
  )
}
