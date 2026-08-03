% Ejercicio 4 - Versión sin freqz

N = 100;
n = 0:N-1;

% Parte 1: Generar señal
m = rand();
x = cos(2*pi*n/20 + 2*pi*m) + 0.5*randn(1, N);

% Parte 2: Coeficientes del filtro
b = [-0.0857, 0.3429, 0.4856, 0.3429, -0.0857];
a = 1;

% Parte 3: Aplicar filtro
y = filter(b, a, x);

% Parte 4: Mostrar señales
figure;
plot(n, x, 'b', 'DisplayName', 'x[n]');
hold on;
plot(n, y, 'r', 'DisplayName', 'y[n]');
title('Señal original y señal filtrada');
xlabel('n'); ylabel('Amplitud');
legend; grid on;

% Parte 5: Calcular H(e^jw) manualmente con FFT
L = 1024;  % Alta resolución
H = fft(b, L);  % FFT de los coeficientes (respuesta en frecuencia)
H = fftshift(H);  % Centrado en [-pi, pi]
w = linspace(-pi, pi, L);  % Eje de frecuencia

% Mostrar módulo y fase de H(e^jw)
figure;
subplot(2,1,1); plot(w, abs(H)); title('|H(e^{j\omega})|');
xlabel('\omega [rad/muestra]'); ylabel('Magnitud');

subplot(2,1,2); plot(w, angle(H)); title('Fase de H(e^{j\omega})');
xlabel('\omega [rad/muestra]'); ylabel('Fase [rad]');

% Parte 6: Respuesta del sistema a x[n] = 2*cos(1.77n - pi/2)
w0 = 1.77;

% Convertimos w0 a índice
[~, idx_w0] = min(abs(w - w0));
H_w0 = H(idx_w0);

A = 2;
phi = -pi/2;

% Calculamos magnitud y fase
mag = abs(H_w0);
fase = angle(H_w0);

% Mostramos la expresión final
fprintf('La salida del sistema ante x[n] = 2cos(1.77n - pi/2) es:\n');
fprintf('y[n] = %.4f * cos(1.77n + %.4f)\n', A*mag, fase + phi);


