<x-mail::message>
# Halo {{ $task->assignee->name }},

Anda telah ditugaskan untuk mengerjakan tugas baru.

**Judul Tugas:** {{ $task->title }}
**Prioritas:** {{ ucfirst($task->priority) }}
**Tenggat Waktu:** {{ $task->due_date ? $task->due_date->format('d M Y') : 'Tidak ada' }}

Silakan cek dashboard untuk detail lebih lanjut.

<x-mail::button :url="config('app.url') . '/tasks/' . $task->id">
Lihat Tugas
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>