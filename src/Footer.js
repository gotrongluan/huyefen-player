import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
    return (
        <div className={styles.footer}>
            <span className={styles.brand}>
                HuYeFen Player
            </span>
            <span className={styles.text}>
                © 2020 HuYeFen Inc. All rights reserved.
            </span>
        </div>
    )
};

export default Footer;