% Definir el intervalo de n
m = -5:5; % Índices de la señal original

% Definir la secuencia escalón unitario u[n]
x = (m >= 0); 

% Desplazamiento de 3 muestras a la derecha
n0 = 3;

% Llamar a la función desplazaseq
[y, n] = desplazaseq(x, m, n0);

% Definir el intervalo de n
n = -5:5; % Índices de la señal original

% Definir la secuencia escalón unitario u[n]
x2 = (n >= 0); 

% Aplicar la reflexión temporal
[y, n_ref] = reflexseq(x2, n);
