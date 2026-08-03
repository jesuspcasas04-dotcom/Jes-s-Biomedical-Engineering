% Definición de la secuencia x[n]
nx = -3:3; % Eje de tiempo discreto
x = [3 11 7 0 -1 4 2]; % Entrada x[n]

% Desplazamiento de la señal x[n] en 2 unidades a la derecha (retardo)
[xd, nxd] = desplazaseq(x, nx, 2);
xd = [0 0 xd]; % Añadir ceros al inicio para mantener la referencia temporal

% Caso 1: Ruido gaussiano normal
w1 = randn(1, length(xd));
y1 = xd + w1;

% Caso 2: Ruido gaussiano con mayor varianza (multiplicado por 10)
w2 = 10 * randn(1, length(xd));
y2 = xd + w2;

% Cálculo de la correlación cruzada en ambos casos
[corr_xy1, lag1] = xcorr(y1, x);
[corr_xy2, lag2] = xcorr(y2, x);

% Gráfica de las correlaciones
figure;
subplot(2,1,1);
stem(lag1, corr_xy1, 'filled');
title('Correlación cruzada con ruido estándar');
xlabel('Desplazamiento');
ylabel('Correlación');
grid on;

subplot(2,1,2);
stem(lag2, corr_xy2, 'filled');
title('Correlación cruzada con ruido amplificado (x10)');
xlabel('Desplazamiento');
ylabel('Correlación');
grid on;

% Segunda parte: Ruido blanco gaussiano y autocorrelación
w = randn(1, 1000); % Generación de ruido blanco gaussiano con 1000 muestras
[corr_w, lags_w] = xcorr(w, 'biased'); % Cálculo de autocorrelación

% Gráfica de la autocorrelación del ruido blanco
figure;
plot(lags_w, corr_w);
title('Autocorrelación del ruido blanco gaussiano');
xlabel('Desplazamiento');
ylabel('Autocorrelación');
grid on;
