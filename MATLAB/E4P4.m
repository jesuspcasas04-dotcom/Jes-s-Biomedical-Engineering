% Ejercicio 4: Reconstrucción práctica con interpolación lineal con retardo

% Parámetros de la señal original
f = 15; % Frecuencia de la señal analógica (en Hz)
fs = 10*f; % Frecuencia de muestreo (puedes probar con diferentes valores de fs)
Ts = 1/fs; % Periodo de muestreo
T = 1; % Duración de la señal (en segundos)
t = [0:0.001:T]; % Vector de tiempo para la señal original (alta resolución)
x = cos(2*pi*f*t); % Señal coseno analógica original

% Señal muestreada
N = fs*T; % Número de muestras
n = 0:N-1; % Índices de las muestras
xn = cos(2*pi*f*n*Ts); % Señal muestreada

% Gráfico original y muestreo
figure(1);
plot(t, x, 'b.-'); hold on; % Señal original
stem(n*Ts, xn, 'ro'); % Muestras discretas
xlabel('Tiempo (s)');
ylabel('Amplitud');
legend('Original', 'Muestras');
grid on;

% Reconstrucción con interpolación lineal con retardo
xr = [0 xn]; % Añadir un valor de retardo al principio

% Graficar la señal reconstruida
figure(2);
plot(t, x, 'b.-'); hold on; % Señal original
stem(n*Ts, xn, 'ro'); % Muestras discretas
plot(n*Ts, xr(1:end-1), 'k*-'); % Señal reconstruida con interpolación lineal
legend('Original', 'Muestras', 'Reconstruida');
xlabel('Tiempo (s)');
ylabel('Amplitud');
grid on;

