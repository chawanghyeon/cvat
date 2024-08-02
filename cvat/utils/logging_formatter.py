import re
import logging


class NoColorFormatter(logging.Formatter):
    def format(self, record):
        # Remove ANSI escape codes
        def remove_color(text):
            if type(text) not in [str, bytes]:
                return text
            return re.sub(r'\x1b\[[0-9;]*[mK]', '', text)

        record.args = tuple(remove_color(arg) for arg in record.args)

        return super().format(record)
