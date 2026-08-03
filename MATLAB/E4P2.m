clc; clear; close all;

%% **1. Señal x[n] = 2δ[n+2] - δ[n-4], con -5 ≤ n ≤ 5**
n1 = -5:5; % Rango de la secuencia

% Definir la función delta discreta
delta = @(n) (n == 0); 

% Definir la señal x[n]
x1 = 2 * delta(n1 + 2) - delta(n1 - 4);

% Graficar la señal
figure;
stem(n1, x1, 'filled');
xlabel('n');
ylabel('x[n]');
title('x[n] = 2\delta[n+2] - \delta[n-4]');
grid on;

%% **2. Señal x[n] = n[u[n] - u[n-10]] + 10e^{-0.3(n-10)}[u[n-10] - u[n-20]], con 0 ≤ n ≤ 20**
n2 = 0:20;

% Definir la función escalón unitario u[n]
u = @(n) (n >= 0);

% Definir la señal x[n]
x2 = n2 .* (u(n2) - u(n2 - 10)) + 10 * exp(-0.3 * (n2 - 10)) .* (u(n2 - 10) - u(n2 - 20));

% Graficar la señal
figure;
stem(n2, x2, 'filled');
xlabel('n');
ylabel('x[n]');
title('x[n] = n[u[n] - u[n-10]] + 10e^{-0.3(n-10)}[u[n-10] - u[n-20]]');
grid on;

%% **3. Señal x[n] = e^{j\pi n/6} + e^{j\pi n/3}, con -10 ≤ n ≤ 10**
n3 = -10:10;

% Definir la señal compleja
x3 = exp(1j * pi * n3 / 6) + exp(1j * pi * n3 / 3);

% Extraer parte real e imaginaria
real_part = real(x3);
imag_part = imag(x3);

% Graficar la parte real
figure;
subplot(2,1,1);
stem(n3, real_part, 'filled');
xlabel('n');
ylabel('Re\{x[n]\}');
title('Parte Real de x[n]');
grid on;

% Graficar la parte imaginaria
subplot(2,1,2);
stem(n3, imag_part, 'filled');
xlabel('n');
ylabel('Im\{x[n]\}');
title('Parte Imaginaria de x[n]');
grid on;
