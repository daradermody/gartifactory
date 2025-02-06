import React from 'react'
import {EuiIcon, EuiPageHeader } from '@elastic/eui'

import logo from './assets/logo.svg'

export function Header() {
  return (
    <EuiPageHeader
      pageTitle={(
        <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'baseline', fontSize: '50px', }}>
          <div style={{ fontFamily: '"Meow Script"', transform: 'translate(0px, 13px)', fontSize: '100px', color: '#3367d6' }}>gar</div>
          <div style={{ fontFamily: 'Roboto', color: '#61a63a' }}>tifactory</div>
        </div>
      )}
      iconType={() => <EuiIcon type={logo} style={{ inlineSize: '60px', blockSize: '60px', marginRight: '8px' }}/>}
      style={{ margin: '32px 0 80px' }}
    />
  )
}