import type { ChangeEvent, FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import Logo from '../../public/logo.png'

interface Props extends React.HTMLAttributes<HTMLHeadingElement> {
  searchSubmit?: (e: FormEvent<HTMLFormElement>) => void
  searchOnChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export const Header: React.FC<Props> = ({
  className,
  searchSubmit,
  searchOnChange,
  ...props
}) => {
  return (
    <header className={`${className}`} {...props}>
      <div className="flex flex-col items-center lg:flex-row lg:justify-start lg:pl-9 lg:pt-4">
        <Link href={'/'}>
          <Image
            src={Logo}
            width={150}
            height={150}
            alt={'Logo da SKA Distribuição'}
            className="h-auto max-h-[150px] w-auto max-w-[150px]"
            placeholder="blur"
          />
        </Link>
        <form
          className="form-control flex items-center"
          onSubmit={searchSubmit}
        >
          <div className="input-group flex justify-center lg:ml-20 lg:justify-start">
            <input
              type="text"
              placeholder="Search…"
              className="input-bordered input w-96"
              onChange={searchOnChange}
            />
            <label htmlFor="search" className="btn-square btn rounded-r">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </label>
            <input type="submit" id="search" className="hidden" />
          </div>
        </form>
      </div>
    </header>
  )
}
