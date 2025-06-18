describe('Basic Tests', () => {
  test('1 + 1 should equal 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('basic string concatenation', () => {
    const hello = 'hello';
    const world = 'world';
    expect(`${hello} ${world}`).toBe('hello world');
  });

  test('array length', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
  });
}); 