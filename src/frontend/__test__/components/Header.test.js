import React from 'react'
import { mount } from 'enzyme'
import {create} from 'react-test-renderer'
import Header from '../../components/Header'
import ProviderMock from '../../__mocks__/providerMock'

describe('<Header />',()=>{
  test('should has 1 image', () => {
    const header = mount(
    <ProviderMock>
      <Header></Header>
    </ProviderMock>)

    expect(header.find('.header__img')).toHaveLength(1)
  })

  test('snapshot',()=>{
    const header = create(
      <ProviderMock>
        <Header></Header>
      </ProviderMock>)

    expect(header.toJSON()).toMatchSnapshot()
  })
})