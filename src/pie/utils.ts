import {ResponsiveSizeOptions, SizeOptions} from './types';

export const isResponsiveSize = (size: SizeOptions): size is ResponsiveSizeOptions => {
    return 'responsive' in size;
};
