describe('main', () => {
  it('Should bootstrap without throwing', async () => {
    try {
      await import('./index')
    } catch (error) {
      expect(error).not.toBeTruthy()
    }
  })
})