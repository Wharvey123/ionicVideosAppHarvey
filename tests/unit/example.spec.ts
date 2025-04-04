import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'
import { describe, expect, test } from 'vitest'

describe('HomeView.vue', () => {
  test('renders home vue', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toMatch('')
  })
})
