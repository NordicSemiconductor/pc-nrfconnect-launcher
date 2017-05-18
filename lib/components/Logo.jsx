import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../resources/nordiclogo_neg.png';

const Logo = ({
    src,
    href,
    alt,
    cssClass,
    containerCssClass,
}) => (
    <div className={containerCssClass}>
        <a href={href} target="_blank" rel="noopener noreferrer">
            <img className={cssClass} src={src} alt={alt} />
        </a>
    </div>
);

Logo.propTypes = {
    src: PropTypes.string,
    href: PropTypes.string,
    alt: PropTypes.string,
    cssClass: PropTypes.string,
    containerCssClass: PropTypes.string,
};

Logo.defaultProps = {
    src: logo,
    href: 'http://www.nordicsemi.com/nRFConnect',
    alt: 'nRF Connect',
    cssClass: 'core-logo',
    containerCssClass: 'core-logo-container',
};

export default Logo;
