import React from 'react'
import { mount } from 'enzyme'
import {create} from 'react-test-renderer'
import Footer from '../../components/Footer'


describe('<Footer />',()=>{
  const footer = mount(<Footer/>)

  test('render footer component',()=>{
    expect(footer.length).toEqual(1)
  })

  test('Footer has 3 anchors',()=>{
    expect(footer.find('a')).toHaveLength(3)
  })

  test('footer Snapshot',()=>{
    const footer = create(<Footer/>)
    expect(footer.toJSON()).toMatchSnapshot()
  })
})