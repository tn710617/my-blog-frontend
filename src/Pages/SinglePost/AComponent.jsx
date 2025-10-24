import React, { useCallback } from "react";
import { useNavigate } from "react-router";

export default function AComponent(incomingProps = {}) {
  const navigate = useNavigate();
  const { children, href, ...rest } = incomingProps || {};

  const isHashLink = typeof href === 'string' && href.startsWith('#');

  const isInternal = (() => {
    if (!href) return false;
    try {
      // Absolute URL: compare hostnames
      const url = new URL(href, window.location.origin);
      return url.origin === window.location.origin;
    } catch {
      // Relative URL treated as internal
      return typeof href === 'string' && (href.startsWith('/') || href.startsWith('#'));
    }
  })();

  const handleClick = useCallback(
    (e) => {
      if (!isInternal || !href) return; // Let browser handle external links
      e.preventDefault();

      if (isHashLink) {
        // For hash links on the same page, use window.location.hash to trigger scroll
        window.location.hash = href;
      } else {
        // Use client-side navigation for internal links so query changes are handled
        try {
          const url = new URL(href, window.location.origin);
          navigate(`${url.pathname}${url.search}${url.hash}`);
        } catch {
          navigate(href);
        }
      }
    },
    [isInternal, href, isHashLink, navigate]
  );

  // External links open in new tab; internal links navigate in-app
  const linkProps = isInternal
    ? { onClick: handleClick }
    : { target: "_blank", rel: "noopener noreferrer" };

  return (
    <a
      href={href}
      {...rest}
      {...linkProps}
      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
    >
      {children}
    </a>
  );
}
