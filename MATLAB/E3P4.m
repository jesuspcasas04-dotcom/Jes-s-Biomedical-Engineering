%%%%%% Reconstrucción Ideal de la Señal Analógica

% Parámetros de la señal
f = 15; % Frecuencia de la señal analógica
T = 1; % Duración de la señal
t = [0:0.001:1]; % Vector de tiempos (tiempo continuo)
x = cos(2*pi*f*t); % Señal coseno analógica original

% Frecuencia de muestreo
fs = 1.5 * f; % Frecuencia de muestreo = 2 veces la frecuencia de la señal
Ts = 1/fs; % Intervalo de muestreo
N = fs * T; % Número de muestras = frecuencia de muestreo x tiempo
n = 0:N-1; % Índice de muestras

% Señal discreta muestreada
xn = cos(2*pi*f*n/fs); % Señal discreta muestreada

% Reconstrucción Ideal
xr = zeros(size(t)); % Inicializa el vector de la señal reconstruida

% Definición de la función sinc manualmente
sinc_func = @(x) sin(pi*x) ./ (pi*x);

% Reconstrucción ideal utilizando la fórmula de la suma de sinc
for m = 1:length(n)
    xr = xr + xn(m) * sinc_func((t - n(m) * Ts) / Ts); % Interpolación ideal
end

% Crear subgráficas separadas
figure;

% Graficar la señal original
subplot(3, 1, 1); % 3 filas, 1 columna, primera subgráfica
plot(t, x, 'b.-');
title('Señal Original');
xlabel('Tiempo (s)');
ylabel('Amplitud');
grid on;

% Graficar las muestras discretas
subplot(3, 1, 2); % 3 filas, 1 columna, segunda subgráfica
stem(n * Ts, xn, 'ro');
title('Muestras Discretas');
xlabel('Tiempo (s)');
ylabel('Amplitud');
grid on;

% Graficar la señal original y reconstruida en la misma gráfica
subplot(3, 1, 3); % 3 filas, 1 columna, tercera subgráfica
plot(t, x, 'b.-'); % Señal original en azul
hold on;
plot(t, xr, 'k'); % Señal reconstruida en negro
title('Comparación: Señal Original vs. Señal Reconstruida');
xlabel('Tiempo (s)');
ylabel('Amplitud');
legend('Señal Original', 'Señal Reconstruida');
grid on;
