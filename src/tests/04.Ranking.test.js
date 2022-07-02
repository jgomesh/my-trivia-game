import React from "react";
import { renderWithRouterAndRedux } from './helpers/renderWithRouterAndRedux';
import { cleanup, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import App from "../App";
import localStorageMock from './mocks/localMock';

describe('Testa a página de Ranking', () => {
  beforeEach(cleanup)
  it('01. Testa componentes da página ranking', () => {
    const { history } = renderWithRouterAndRedux(<App />);

    jest.spyOn(Object.getPrototypeOf(localStorage), "setItem");
    jest.spyOn(Object.getPrototypeOf(localStorage), "getItem");

    localStorage.setItem('ranking', JSON.stringify(localStorageMock));

    history.push('/ranking');

    expect(history.location.pathname).toBe('/ranking');
    expect(localStorage.getItem).toHaveBeenCalled();

    localStorageMock.forEach((user) => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(`Score: ${user.score}`)).toBeInTheDocument();
    })

    const BUTTON_LOGIN = screen.getByRole('button', {name: /play again/i});
    expect(BUTTON_LOGIN).toBeInTheDocument();

    userEvent.click(BUTTON_LOGIN);

    expect(history.location.pathname).toBe('/');    
  })
});
