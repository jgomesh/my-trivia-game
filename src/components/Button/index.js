import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

class Button extends Component {
  render() {
    const {
      title,
      onClick,
      className,
      disabled,
    } = this.props;
    return (
      <button
        type="button"
        onClick={ onClick }
        className={ className }
        disabled={ disabled }
      >
        { title }
      </button>
    );
  }
}

export default Button;

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  onClick: () => {},
  className: '',
  disabled: false,
};
