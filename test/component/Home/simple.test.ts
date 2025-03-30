import { render } from '@testing-library/vue';
import Home from '../../../src/components/Home.vue';

test('it should work', () => {
    const { getByText } = render(Home);
    getByText('💖 Hello World!');
    expect(true).toBe(true);
});