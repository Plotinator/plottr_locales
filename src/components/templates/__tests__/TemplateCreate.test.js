import React from 'react'
import { mount } from 'enzyme'
import TemplateCreate, { testIds } from '../TemplateCreate'

import { connect } from '../../__fixtures__/pltr-connector'

describe('TemplateCreate', () => {
  const props = {
    close: jest.fn(),
    saveTemplate: jest.fn(),
    type: 'plotlines',
  }

  const event = (value) => ({
    currentTarget: {
      value,
    },
  })

  beforeEach(() => jest.clearAllMocks())

  it.skip('creates a template', () => {
    const tree = mount(connect(() => <TemplateCreate {...props} />))

    tree.findTypeWithTestId('FormControl', testIds.name).simulate('change', event('Name'))
    tree
      .findTypeWithTestId('FormControl', testIds.description)
      .simulate('change', event('Description'))
    tree.findTypeWithTestId('FormControl', testIds.link).simulate('change', event('Link'))
    tree.findTypeWithTestId('Button', testIds.save).simulate('click')

    expect(props.saveTemplate).toHaveBeenCalledWith({
      type: 'plotlines',
      data: {
        name: 'Name',
        description: 'Description',
        link: 'Link',
      },
    })
    expect(props.close).toHaveBeenCalled()
  })

  it('closes on cancel', () => {
    const tree = mount(connect(() => <TemplateCreate {...props} />))

    tree.findTypeWithTestId('button', testIds.cancel).simulate('click')
    expect(props.close).toHaveBeenCalled()
  })

  it('renders the correct title', () => {
    const treeTimeline = mount(connect(() => <TemplateCreate {...props} />))
    expect(treeTimeline.findTypeWithTestId('ModalTitle', testIds.title).props().children).toContain(
      'Timeline'
    )

    const treeCharacters = mount(connect(() => <TemplateCreate {...props} type="characters" />))
    expect(
      treeCharacters.findTypeWithTestId('ModalTitle', testIds.title).props().children
    ).toContain('Character')

    const treeScenes = mount(connect(() => <TemplateCreate {...props} type="scenes" />))
    expect(treeScenes.findTypeWithTestId('ModalTitle', testIds.title).props().children).toContain(
      'Scene'
    )

    const treeOther = mount(connect(() => <TemplateCreate {...props} type="other" />))
    expect(treeOther.findTypeWithTestId('ModalTitle', testIds.title).props().children).toContain(
      'Character'
    )
  })
})
