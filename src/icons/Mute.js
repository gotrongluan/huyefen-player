import React from 'react';
import Icon from '@ant-design/icons';

const MuteSvg = ({ size = "1em" }) => (
    <svg t="1584502292665" className="icon" viewBox="0 0 1187 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="23791" width={size} height={size}><path d="M524.53376 25.8048c63.20128-49.39776 112.35328-22.9376 112.35328 56.44288V946.5856c0 75.85792-49.152 98.79552-105.34912 49.39776l-252.88704-207.99488H139.96032c-79.0528 0-138.73152-63.488-138.73152-139.38688V364.46208c0-75.81696 63.20128-139.34592 138.73152-139.34592h131.6864L524.53376 25.8048z" p-id="23792" fill="#ffffff"></path></svg>
);

export default ({ fontSize, ...restProps }) => <Icon {...restProps} component={() => <MuteSvg size={fontSize} />} />;