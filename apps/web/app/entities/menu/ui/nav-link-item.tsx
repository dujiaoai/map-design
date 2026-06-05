import { Link } from 'react-router'

import type { NavItem } from '../lib/build-nav-tree'

export function NavLinkItem({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const paddingLeft = 12 + depth * 12

  if (item.children?.length) {
    return (
      <li>
        <span
          className="text-muted-foreground block py-1.5 text-xs font-medium tracking-wide uppercase"
          style={{ paddingLeft }}
        >
          {item.title}
        </span>
        <ul className="space-y-0.5">
          {item.children.map((child) => (
            <NavLinkItem key={child.id} depth={depth + 1} item={child} />
          ))}
        </ul>
      </li>
    )
  }

  if (item.external) {
    return (
      <li>
        <a
          className="hover:bg-muted block rounded-md py-1.5 text-sm transition-colors"
          href={item.href}
          rel="noreferrer"
          style={{ paddingLeft }}
          target="_blank"
        >
          {item.title}
        </a>
      </li>
    )
  }

  if (item.href === '#') {
    return (
      <li>
        <span className="text-muted-foreground block py-1.5 text-sm" style={{ paddingLeft }}>
          {item.title}
        </span>
      </li>
    )
  }

  return (
    <li>
      <Link
        className="hover:bg-muted block rounded-md py-1.5 text-sm transition-colors"
        style={{ paddingLeft }}
        to={item.href}
      >
        {item.title}
      </Link>
    </li>
  )
}
