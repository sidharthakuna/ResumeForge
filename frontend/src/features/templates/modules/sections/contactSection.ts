import type { PersonalInfoResponse } from '@/types/api'
import { esc } from '../../renderers/types'
import { icons } from '../icons'

export interface ContactRenderOptions {
  showIcons?: boolean
  linkClass?: string
  format?: 'stacked' | 'inline' | 'sidebar'
  separator?: string
}

export function renderContact(
  info: PersonalInfoResponse | null | undefined,
  opts: ContactRenderOptions = { showIcons: true, format: 'inline', separator: ' • ' }
): string {
  if (!info) return ''

  const email = esc(info.email)
  const phone = esc(info.phone)
  const location = esc(info.location)
  const linkedin = esc(info.linkedinUrl)
  const github = esc(info.githubUrl)
  const portfolio = esc(info.portfolioUrl)

  const items: { text: string; link?: string; icon?: string }[] = []

  if (location) items.push({ text: location, icon: icons.location })
  if (email) items.push({ text: email, link: `mailto:${email}`, icon: icons.email })
  if (phone) items.push({ text: phone, link: `tel:${phone}`, icon: icons.phone })
  if (linkedin) {
    const label = linkedin.replace(/^https?:\/\//, '')
    items.push({ text: label, link: linkedin.startsWith('http') ? linkedin : `https://${linkedin}`, icon: icons.linkedin })
  }
  if (github) {
    const label = github.replace(/^https?:\/\//, '')
    items.push({ text: label, link: github.startsWith('http') ? github : `https://${github}`, icon: icons.github })
  }
  if (portfolio) {
    const label = portfolio.replace(/^https?:\/\//, '')
    items.push({ text: label, link: portfolio.startsWith('http') ? portfolio : `https://${portfolio}`, icon: icons.portfolio })
  }

  if (opts.format === 'sidebar') {
    return items
      .map((item) => {
        const content = item.link
          ? `<a href="${item.link}" class="${opts.linkClass || ''}" style="color:inherit;text-decoration:none;">${item.text}</a>`
          : item.text
        return `<div class="sidebar-item">${opts.showIcons && item.icon ? item.icon : ''}${content}</div>`
      })
      .join('')
  }

  if (opts.format === 'stacked') {
    return items
      .map((item) => {
        const content = item.link
          ? `<a href="${item.link}" class="${opts.linkClass || ''}">${item.text}</a>`
          : item.text
        return `<div>${opts.showIcons && item.icon ? item.icon : ''}${content}</div>`
      })
      .join('')
  }

  // Inline format with separator
  return items
    .map((item) => {
      const content = item.link
        ? `<a href="${item.link}" class="${opts.linkClass || ''}">${item.text}</a>`
        : item.text
      return `<span>${opts.showIcons && item.icon ? item.icon : ''}${content}</span>`
    })
    .join(opts.separator || ' • ')
}
